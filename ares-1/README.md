# ares-1

This folder contains genesis data for the testnet `ares-1` and instructions on how to join the network.

## Quick links

| name           | value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| genesis.json   | https://raw.githubusercontent.com/mars-protocol/networks/main/ares-1/genesis.json |
| git tag        | v1.0.0-rc7                                                                        |
| block explorer | https://testnet-explorer.marsprotocol.io                                          |
| seeds          | TBA                                                                               |

## Requirements

### Hardware

Here are the minimal hardware configs required for running a validator/sentry node:

- 16 GB RAM
- 4 vCPUs
- 200 GB disk space

### Software

- Linux operating system (the following instructions are based on Ubuntu 20.04+)
- [Go v1.19+](https://golang.org/doc/install)

## Instructions

### Install basic packages

```bash
sudo apt update
sudo apt upgrade
sudo apt install make build-essential gcc git jq chrony
```

### Install Go

Follow the instructions [here](https://golang.org/doc/install) to install Go.

Alternatively, for Ubuntu LTS, you can do:

```bash
wget -q -O - https://go.dev/dl/go1.19.5.linux-amd64.tar.gz | sudo tar xvzf - -C /usr/local
```

Configure relevant environment variables:

```bash
cat <<EOT >> $HOME/.bashrc
export GOROOT=/usr/local/go
export GOPATH=$HOME/.go
export GOBIN=$GOPATH/bin
export GO111MODULE=on
export PATH=$PATH:$GOPATH/bin:$GOROOT/bin
EOT
```

```bash
source ~/.bashrc
```

Test the installation:

```bash
$ go version
go version go1.19.5 linux/amd64
```

### Set up node software

Compile marsd:

```sh
git clone https://github.com/mars-protocol/hub
cd hub
git checkout v1.0.0-rc7
make install
```

Initialize config folder:

```sh
marsd init <moniker> --chain-id ares-1
```

Create a key to be used as the validator operator – make sure you save the mnemonics!

```sh
marsd keys add <key-name>
```

Download genesis file:

```sh
wget -O ~/.mars/config/genesis.json https://raw.githubusercontent.com/mars-protocol/networks/main/ares-1/genesis.json
```

Set seed node(s):

```sh
export SEEDS=TBD
sed -i.bak -e "s/^seeds *=.*/seeds = \"$SEEDS\"/" ~/.mars/config/config.toml
```

### Run the node

You can now launch the network!

```sh:
marsd start
```

However, running the network this way requires a shell to always be open. You can, instead, create a service file that will manage running the network for you.

```bash
sudo cat <<EOF >> /etc/systemd/system/marsd.service
[Unit]
Description=Mars Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
ExecStart=$HOME/.go/bin/marsd start
Restart=on-failure
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo systemctl daemon-reload
sudo systemctl start marsd
journalctl -o cat -fu marsd
```

### Backup validator key

There are certain files that you need to backup to be able to restore your validator if, for some reason, it is damaged or lost in some way. Please make a secure backup of the following file(s):

```plain
~/.mars/config/priv_validator_key.json
```

It is recommended that you encrypt the backup of these file(s).
