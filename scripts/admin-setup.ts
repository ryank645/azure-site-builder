#!/usr/bin/env npx tsx

/**
 * Azure Site Builder — Admin Setup Script
 *
 * Run this once to provision all Azure resources in the claude-resources RG,
 * then again each time you onboard a new site/user.
 *
 * Usage:
 *   npx tsx scripts/admin-setup.ts
 *
 * What it does:
 *   1. Verifies Azure CLI is installed and you're logged in
 *   2. Creates shared App Insights + Log Analytics (once, skips if exists)
 *   3. Creates a new Static Web App for the user/project
 *   4. Writes config to ~/.site-builder/config.json (no user action needed)
 *   5. Optionally generates a portable config file to send to a remote user
 */

import { execSync } from "child_process";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ── Azure config (hardcoded to claude-resources RG) ──────────────────────────

const SUBSCRIPTION = "5def3d89-62c5-4b4e-afea-c447e4b321f1";
const RESOURCE_GROUP = "claude-resources";
const LOCATION = "westeurope";
const TENANT = "oxfordeconomics.com";
const LOG_WORKSPACE_NAME = "claude-sites-logs";
const APPINSIGHTS_NAME = "claude-sites-appinsights";

const CONFIG_DIR = path.join(os.homedir(), ".site-builder");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// ── Config file ──────────────────────────────────────────────────────────────

interface SiteBuilderConfig {
  deploymentToken?: string;
  appInsightsConnectionString?: string;
  siteName?: string;
  siteUrl?: string;
  updatedAt?: string;
}

function readConfig(): SiteBuilderConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeConfig(config: SiteBuilderConfig) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  config.updatedAt = new Date().toISOString();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd: string, silent = false): string {
  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : ["pipe", "pipe", "pipe"],
    });
    return result.trim();
  } catch (e: any) {
    if (silent) return "";
    throw e;
  }
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function heading(text: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${text}`);
  console.log(`${"─".repeat(60)}\n`);
}

function success(text: string) {
  console.log(`  [OK] ${text}`);
}

function info(text: string) {
  console.log(`  [..] ${text}`);
}

function warn(text: string) {
  console.log(`  [!!] ${text}`);
}

function fail(text: string) {
  console.error(`  [FAIL] ${text}`);
}

// ── Step 1: Preflight checks ────────────────────────────────────────────────

async function preflight() {
  heading("Step 1: Preflight Checks");

  // Azure CLI installed?
  const azVersion = run("az version --output json", true);
  if (!azVersion) {
    fail("Azure CLI is not installed.");
    console.log("         Install it: winget install Microsoft.AzureCLI");
    console.log(
      "         Then restart your terminal and run this script again."
    );
    process.exit(1);
  }
  success("Azure CLI installed");

  // Logged in?
  const account = run(`az account show --output json`, true);
  if (!account) {
    info(`Not logged in. Opening browser for Azure login...`);
    run(`az login --tenant ${TENANT}`);
  }
  success("Logged in to Azure");

  // Set subscription
  run(`az account set --subscription ${SUBSCRIPTION}`);
  success(`Subscription set to ${SUBSCRIPTION}`);

  // Check RG exists
  const rgCheck = run(
    `az group show --name ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --output json`,
    true
  );
  if (!rgCheck) {
    info(`Creating resource group ${RESOURCE_GROUP}...`);
    run(
      `az group create --name ${RESOURCE_GROUP} --location ${LOCATION} --subscription ${SUBSCRIPTION}`
    );
  }
  success(`Resource group '${RESOURCE_GROUP}' exists`);
}

// ── Step 2: Shared monitoring infrastructure ────────────────────────────────

async function setupMonitoring(): Promise<string> {
  heading("Step 2: Monitoring Infrastructure (shared, one-time)");

  // Log Analytics workspace
  const existingWorkspace = run(
    `az monitor log-analytics workspace show --resource-group ${RESOURCE_GROUP} --workspace-name ${LOG_WORKSPACE_NAME} --subscription ${SUBSCRIPTION} --query id -o tsv`,
    true
  );

  let workspaceId: string;
  if (existingWorkspace) {
    success(`Log Analytics workspace '${LOG_WORKSPACE_NAME}' already exists`);
    workspaceId = existingWorkspace;
  } else {
    info(`Creating Log Analytics workspace '${LOG_WORKSPACE_NAME}'...`);
    workspaceId = run(
      `az monitor log-analytics workspace create --resource-group ${RESOURCE_GROUP} --workspace-name ${LOG_WORKSPACE_NAME} --location ${LOCATION} --subscription ${SUBSCRIPTION} --query id -o tsv`
    );
    success(`Log Analytics workspace created`);
  }

  // Application Insights
  const existingAppInsights = run(
    `az monitor app-insights component show --app ${APPINSIGHTS_NAME} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query connectionString -o tsv`,
    true
  );

  let connectionString: string;
  if (existingAppInsights) {
    success(`Application Insights '${APPINSIGHTS_NAME}' already exists`);
    connectionString = existingAppInsights;
  } else {
    info(`Creating Application Insights '${APPINSIGHTS_NAME}'...`);
    run(
      `az monitor app-insights component create --app ${APPINSIGHTS_NAME} --resource-group ${RESOURCE_GROUP} --location ${LOCATION} --subscription ${SUBSCRIPTION} --kind web --application-type web --workspace ${workspaceId}`
    );
    connectionString = run(
      `az monitor app-insights component show --app ${APPINSIGHTS_NAME} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query connectionString -o tsv`
    );
    success(`Application Insights created`);
  }

  return connectionString;
}

// ── Step 3: Create a Static Web App ─────────────────────────────────────────

async function createSite(): Promise<{
  appName: string;
  token: string;
  hostname: string;
} | null> {
  heading("Step 3: Create a Static Web App");

  const appName = await ask(
    "  Enter a name for the new site (e.g. marketing-site): "
  );

  if (!appName) {
    warn(
      "Skipped — no name entered. You can run this script again to create a site later."
    );
    return null;
  }

  // Check if it already exists
  const existing = run(
    `az staticwebapp show --name ${appName} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query defaultHostname -o tsv`,
    true
  );

  if (existing) {
    warn(`Site '${appName}' already exists at https://${existing}`);
    const reuse = await ask(
      "  Get a fresh deployment token for it? (y/n): "
    );
    if (reuse.toLowerCase() !== "y") return null;
  } else {
    info(`Creating Static Web App '${appName}'...`);
    run(
      `az staticwebapp create --name ${appName} --resource-group ${RESOURCE_GROUP} --location ${LOCATION} --subscription ${SUBSCRIPTION} --sku Free`
    );
    success(`Static Web App '${appName}' created`);
  }

  const token = run(
    `az staticwebapp secrets list --name ${appName} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query "properties.apiKey" -o tsv`
  );

  const hostname = run(
    `az staticwebapp show --name ${appName} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query defaultHostname -o tsv`
  );

  success(`Deployment token retrieved`);
  success(`Site URL: https://${hostname}`);

  return { appName, token, hostname };
}

// ── Step 4: List existing sites ─────────────────────────────────────────────

async function listExistingSites() {
  const sites = run(
    `az staticwebapp list --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query "[].{name:name, url:defaultHostname}" -o json`,
    true
  );

  if (sites) {
    const parsed = JSON.parse(sites);
    if (parsed.length > 0) {
      console.log("\n  Existing sites in this resource group:");
      for (const site of parsed) {
        console.log(`    - ${site.name} → https://${site.url}`);
      }
    }
  }
}

// ── Step 5: Write config ────────────────────────────────────────────────────

async function writeConfigAndFinish(
  connectionString: string,
  site: { appName: string; token: string; hostname: string } | null
) {
  heading("Step 4: Saving Configuration");

  const isLocalSetup = await ask(
    "  Is this the user's computer? (y/n): "
  );

  if (isLocalSetup.toLowerCase() === "y") {
    // ── Write config directly to this machine ──
    const config = readConfig();
    config.appInsightsConnectionString = connectionString;
    if (site) {
      config.deploymentToken = site.token;
      config.siteName = site.appName;
      config.siteUrl = `https://${site.hostname}`;
    }
    writeConfig(config);

    success(`Config written to ${CONFIG_FILE}`);

    heading("Setup Complete");
    console.log("  Everything is configured. The user just needs to:");
    console.log("");
    console.log("  1. Open Claude Code");
    console.log("  2. Run /azure-site-builder:setup  (verifies everything)");
    console.log("  3. Run /azure-site-builder:create-site");
    console.log("  4. Describe the website they want");
    console.log("  5. Iterate with the bot");
    console.log("  6. Say 'publish it' when ready");
    if (site) {
      console.log("");
      console.log(`  Their site will be live at: https://${site.hostname}`);
    }
  } else {
    // ── Generate a portable config file to send to the user ──
    const exportConfig: SiteBuilderConfig = {
      appInsightsConnectionString: connectionString,
      updatedAt: new Date().toISOString(),
    };
    if (site) {
      exportConfig.deploymentToken = site.token;
      exportConfig.siteName = site.appName;
      exportConfig.siteUrl = `https://${site.hostname}`;
    }

    const exportPath = path.join(
      process.cwd(),
      `site-builder-config-${site?.appName || "shared"}.json`
    );
    fs.writeFileSync(exportPath, JSON.stringify(exportConfig, null, 2) + "\n");

    success(`Config file saved to: ${exportPath}`);

    heading("Setup Complete — Send to User");
    console.log("  Send the config file to the user and tell them to run:");
    console.log("");
    console.log("    mkdir %USERPROFILE%\\.site-builder");
    console.log(
      `    copy "${path.basename(exportPath)}" %USERPROFILE%\\.site-builder\\config.json`
    );
    console.log("");
    console.log("  Or on Git Bash / WSL:");
    console.log("");
    console.log("    mkdir -p ~/.site-builder");
    console.log(
      `    cp "${path.basename(exportPath)}" ~/.site-builder/config.json`
    );
    console.log("");
    console.log("  That's it — no environment variables, no Azure login.");
    if (site) {
      console.log(`  Their site will be live at: https://${site.hostname}`);
    }
  }

  // ── Admin reference ──
  heading("Admin Reference");
  console.log(`  Config file location:   ~/.site-builder/config.json`);
  console.log(`  Resource group:         ${RESOURCE_GROUP}`);
  console.log(`  App Insights:           ${APPINSIGHTS_NAME}`);
  console.log("");
  console.log("  Revoke a user's access:");
  console.log(
    `    az staticwebapp secrets reset-api-key --name <app-name> --resource-group ${RESOURCE_GROUP}`
  );
  console.log("");
  console.log("  View monitoring:");
  console.log(
    `    Azure Portal → ${RESOURCE_GROUP} → ${APPINSIGHTS_NAME}`
  );
  console.log("");
  console.log("  Onboard another user: run this script again.");
  console.log("");
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("");
  console.log("  Azure Site Builder — Admin Setup");
  console.log("  ================================");
  console.log(`  Resource Group: ${RESOURCE_GROUP}`);
  console.log(`  Subscription:   ${SUBSCRIPTION}`);
  console.log(`  Location:       ${LOCATION}`);

  await preflight();
  const connectionString = await setupMonitoring();
  await listExistingSites();
  const site = await createSite();
  await writeConfigAndFinish(connectionString, site);
}

main().catch((err) => {
  fail(err.message);
  process.exit(1);
});
