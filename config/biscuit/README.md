This directory contains yaml files for biscuit. These yaml files contain encrypted secrets in a key/value store.

Each secret name is prefixed with the environment name, in the form <env>::<secret name>.

For each secret, there should be an entry for each environment, even if we are going to use identical values, otherwise the app might break. 

The `test_secrets.yaml` file contains unencrypted fake secrets for usage in the unit tests. 
For instance `test::lob-api-key` just contains a nonsense string. This is because we should not actually call external services in our unit tests.
Because `test_secrets.yaml` entries are unencrypted, biscuit does not need to talk to AWS to fetch them, further isolating our unit tests
from external services.
