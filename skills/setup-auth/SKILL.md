---
name: setup-auth
description: Admin tool to create an Azure service principal for the claude-resources resource group. Use this to generate credentials you can give to non-technical users so they can deploy without az login.
allowed-tools: Bash
disable-model-invocation: true
argument-hint: [service-principal-name]
---

# Create Service Principal for Users (Admin Only)

This is an admin tool. It creates a service principal scoped to the `claude-resources` resource group so you can give users a set of credentials for deploying.

## Steps

1. **Check the admin is logged in**:
   ```bash
   az account show
   ```
   If not, run `az login --tenant oxfordeconomics.com`.

2. **Set the subscription**:
   ```bash
   az account set --subscription 5def3d89-62c5-4b4e-afea-c447e4b321f1
   ```

3. **Choose a service principal name**:
   - Use `$ARGUMENTS` if provided, otherwise default to `claude-site-builder-sp`

4. **Create the service principal** with Contributor role scoped to the resource group:
   ```bash
   az ad sp create-for-rbac \
     --name <sp-name> \
     --role Contributor \
     --scopes /subscriptions/5def3d89-62c5-4b4e-afea-c447e4b321f1/resourceGroups/claude-resources \
     --query "{AZURE_CLIENT_ID:appId, AZURE_CLIENT_SECRET:password, AZURE_TENANT_ID:tenant}" \
     -o json
   ```

5. **Show the output** and tell the admin:

   "Here are the credentials. Give these three values to your users:

   ```
   AZURE_CLIENT_ID=<appId>
   AZURE_CLIENT_SECRET=<password>
   AZURE_TENANT_ID=<tenant>
   ```

   **Important:**
   - These credentials grant Contributor access to the `claude-resources` resource group only
   - The user can create/delete Static Web Apps within that RG
   - They CANNOT access any other resource group or subscription resource
   - Store the secret securely — treat it like a password
   - To revoke access later: `az ad sp delete --id <appId>`
   - To rotate the secret: `az ad sp credential reset --id <appId>`"

Service principal name: $ARGUMENTS
