# Vetafi Web App

This is the main vetafi app, built with Play-Framework 2.5 app.

## Prerequisites

Use `vagrant ssh` to enter the development environment.

## Test

Run `sbt test` to run the unit tests.

## Run Locally

You may run the app locally with `./run-local.sh`

The application will reload anytime you make a chance to the source code and refresh.

In local mode, you can use the follow username/password combinations for ID.me sandbox authentication:

| Scope | Account Type | Email |
|-------|--------------|-------|
| Military | Military Family | partner+vetafi_actsm@id.me |
| Military | Military Spouse | partner+vetafi_vet@id.me |
| Military | Retiree | partner+vetafi_retiree@id.me |
| Military | Service Member | partner+vetafi_milfam@id.me |
| Military | Veteran | partner+vetafi_milspouse@id.me |

All these sandbox accounts have the same password, which can be retrieved with this command:

```
biscuit get --filename ../config/biscuit/secrets.yaml id-sandbox-password
```

## Deploy

Run `./deploy-prod.sh` to deploy the application to prod.


