---
name: setup-monitoring
description: Admin tool to create an Application Insights resource in the claude-resources resource group for production monitoring. Run once — all sites share the same instance.
allowed-tools: Bash
disable-model-invocation: true
argument-hint: [app-insights-name]
---

# Create Application Insights Resource (Admin Only)

This creates a shared Application Insights instance in the `claude-resources` resource group. All sites built with this plugin will send telemetry here. Run this once.

## Prerequisites

1. **Check the admin is logged in**:
   ```bash
   az account show
   ```
   If not, run `az login --tenant oxfordeconomics.com`.

2. **Set the subscription**:
   ```bash
   az account set --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1
   ```

## Create the resource

1. **Choose a name**: Use `$ARGUMENTS` if provided, otherwise default to `claude-sites-appinsights`.

2. **Create a Log Analytics workspace** (required by App Insights):
   ```bash
   az monitor log-analytics workspace create \
     --resource-group claude-resources \
     --workspace-name claude-sites-logs \
     --location westeurope \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1
   ```

3. **Create the Application Insights resource**:
   ```bash
   WORKSPACE_ID=$(az monitor log-analytics workspace show \
     --resource-group claude-resources \
     --workspace-name claude-sites-logs \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --query "id" -o tsv)

   az monitor app-insights component create \
     --app <app-insights-name> \
     --resource-group claude-resources \
     --location westeurope \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --kind web \
     --application-type web \
     --workspace $WORKSPACE_ID
   ```

4. **Get the connection string**:
   ```bash
   az monitor app-insights component show \
     --app <app-insights-name> \
     --resource-group claude-resources \
     --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1 \
     --query "connectionString" -o tsv
   ```

## Output to the admin

"Application Insights is set up. Here's what to give your users:

**Connection string:**
```
<connection-string>
```

**Tell users to set this environment variable (one-time, in PowerShell):**
```
[System.Environment]::SetEnvironmentVariable('APPINSIGHTS_CONNECTION_STRING', '<connection-string>', 'User')
```
Then restart their terminal.

**What this enables:**
- Automatic error tracking on published sites
- Page view analytics
- Performance monitoring
- The bot can diagnose production issues using this data

**All data stays in the `claude-resources` resource group.**

**To view dashboards manually:**
Azure Portal → claude-resources → <app-insights-name>

**Cost:** Free tier includes 5GB/month of data ingestion — more than enough for internal sites."

App Insights name: $ARGUMENTS
