# Mars Networks

This repo contains instructions for genesis validators to create genesis staking transactions (gentxs) to start the Mars Hub network.

## Instructions

Install Go 1.19+. On Ubuntu this can be done by:

```bash
wget -q -O - https://go.dev/dl/go1.19.5.linux-amd64.tar.gz | sudo tar xvzf - -C /usr/local
```

Configure relevant environment variables:

```bash
cat <<EOT >> $HOME/.bashrc
export GOROOT=/usr/local/go
export GOPATH=$HOME/.go
export GOBIN=$GOPATH/bin
export PATH=$PATH:$GOPATH/bin:$GOROOT/bin
EOT
```

Download Mars Hub daemon source code and compile. This will generate a `marsd` executable under your `$GOBIN` directory:

```bash
git clone https://github.com/mars-protocol/hub.git
cd hub
git checkout v1.0.0
make install
```

Initialize your node. This will generate your validator signing key at `~/.mars/priv_validator_key.json`; make sure to backup this file:

```bash
marsd init
```

Create your validator operator key:

```bash
marsd keys add validator
```

Add your operator key to the genesis state:

```bash
marsd genesis add-account validator 1000000umars
```

Note that the chain id is `mars-1` and set the self-bond amount to `1000000umars`:

```bash
marsd genesis gentx validator 1000000umars \
  --pubkey "$(marsd tendermint show-validator)" \
  --chain-id mars-1 \
  --commission-rate "..." \
  --commission-max-rate "..." \
  --commission-max-change-rate "..." \
  --moniker "..." \
  --identity "..." \
  --details "..." \
  --website "..." \
  --security-contact "..."
```

The gentx can be found in `~/.mars/config/gentx/gentx-<hash>.json`. Add the file to this repository under the `mars-1/gentxs` folder by making a PR.

## License

Contents of this repository are open source under [GNU General Public License v3](./LICENSE) or later.
