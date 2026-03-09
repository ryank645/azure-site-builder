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
 *   4. Outputs everything the user needs: env vars to copy-paste
 */

import { execSync } from "child_process";
import * as readline from "readline";

// ── Azure config (hardcoded to claude-resources RG) ──────────────────────────

const SUBSCRIPTION = "5def3d89-62c5-4b4e-afea-c447e4b321f1";
const RESOURCE_GROUP = "claude-resources";
const LOCATION = "westeurope";
const TENANT = "oxfordeconomics.com";
const LOG_WORKSPACE_NAME = "claude-sites-logs";
const APPINSIGHTS_NAME = "claude-sites-appinsights";

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd: string, silent = false): string {
  try {
    const result = execSync(cmd, { encoding: "utf-8", stdio: silent ? "pipe" : ["pipe", "pipe", "pipe"] });
    return result.trim();
  } catch (e: any) {
    if (silent) return "";
    throw e;
  }
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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
    console.log("         Then restart your terminal and run this script again.");
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

async function createSite(): Promise<{ appName: string; token: string; hostname: string } | null> {
  heading("Step 3: Create a Static Web App");

  const appName = await ask("  Enter a name for the new site (e.g. marketing-site): ");

  if (!appName) {
    warn("Skipped — no name entered. You can run this script again to create a site later.");
    return null;
  }

  // Check if it already exists
  const existing = run(
    `az staticwebapp show --name ${appName} --resource-group ${RESOURCE_GROUP} --subscription ${SUBSCRIPTION} --query defaultHostname -o tsv`,
    true
  );

  if (existing) {
    warn(`Site '${appName}' already exists at https://${existing}`);
    const reuse = await ask("  Get a fresh deployment token for it? (y/n): ");
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

// ── Output ──────────────────────────────────────────────────────────────────

function printUserInstructions(
  connectionString: string,
  site: { appName: string; token: string; hostname: string } | null
) {
  heading("Setup Complete — User Instructions");

  if (site) {
    console.log("  Give the following to your user:");
    console.log("");
    console.log("  ┌─────────────────────────────────────────────────────────┐");
    console.log("  │  Copy-paste these commands into PowerShell (one-time):  │");
    console.log("  └─────────────────────────────────────────────────────────┘");
    console.log("");
    console.log(`  [System.Environment]::SetEnvironmentVariable('SWA_DEPLOYMENT_TOKEN', '${site.token}', 'User')`);
    console.log(`  [System.Environment]::SetEnvironmentVariable('APPINSIGHTS_CONNECTION_STRING', '${connectionString}', 'User')`);
    console.log("");
    console.log("  Then restart the terminal.");
    console.log("");
    console.log(`  Their site will be live at: https://${site.hostname}`);
    console.log("");
    console.log("  ┌─────────────────────────────────────────────────────────┐");
    console.log("  │  What the user does next:                               │");
    console.log("  │                                                         │");
    console.log("  │  1. Open Claude Code                                    │");
    console.log("  │  2. Run /azure-site-builder:setup (checks everything)   │");
    console.log("  │  3. Run /azure-site-builder:create-site                 │");
    console.log("  │  4. Describe the website they want                      │");
    console.log("  │  5. Iterate with the bot                                │");
    console.log("  │  6. Run /azure-site-builder:deploy-site to publish      │");
    console.log("  └─────────────────────────────────────────────────────────┘");
  } else {
    console.log("  Monitoring is set up. Run this script again to create a site for a user.");
    console.log("");
    console.log(`  App Insights connection string (for reference):`);
    console.log(`  ${connectionString}`);
  }

  console.log("");
  console.log("  ┌─────────────────────────────────────────────────────────┐");
  console.log("  │  Admin reference:                                       │");
  console.log("  │                                                         │");
  console.log("  │  Revoke a user's access:                                │");
  console.log("  │    az staticwebapp secrets reset-api-key \\              │");
  console.log(`  │      --name <app-name> \\                                │`);
  console.log(`  │      --resource-group ${RESOURCE_GROUP}                  │`);
  console.log("  │                                                         │");
  console.log("  │  View monitoring dashboard:                             │");
  console.log(`  │    Azure Portal → ${RESOURCE_GROUP} → ${APPINSIGHTS_NAME}│`);
  console.log("  │                                                         │");
  console.log("  │  Run this script again to onboard another user/site.    │");
  console.log("  └─────────────────────────────────────────────────────────┘");
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
  printUserInstructions(connectionString, site);
}

main().catch((err) => {
  fail(err.message);
  process.exit(1);
});
