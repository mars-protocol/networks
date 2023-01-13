# ares-1

This folder contains genesis data for the testnet `ares-1`.

### Quick Links
Genesis: https://raw.githubusercontent.com/mars-protocol/networks/main/ares-1/genesis.json

Git tag: v1.0.0-rc7

Block explorer: https://testnet-explorer.marsprotocol.io/

Seeds: TBA

#### Hardware Requirements
Here are the minimal hardware configs required for running a validator/sentry node
 - 16GB RAM
 - 4vCPUs
 - 200GB Disk space

#### Software Requirements
- Ubuntu 20.04 or higher
- [Go v1.19.4](https://golang.org/doc/install)

### Installation Steps

#### Install Prerequisites 

The following are necessary to build marsd from source. 

##### 1. Basic Packages

```sh
# update the local package list and install any available upgrades 
sudo apt-get update && sudo apt upgrade -y 
# install toolchain and ensure accurate time synchronization 
sudo apt-get install make build-essential gcc git jq chrony -y
```


##### 2. Install Go
Follow the instructions [here](https://golang.org/doc/install) to install Go.

Alternatively, for Ubuntu LTS, you can do:

```sh
wget https://golang.org/dl/go1.19.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.4.linux-amd64.tar.gz
```

Unless you want to configure in a non standard way, then set these in the `.profile` in the user's home (i.e. `~/`) folder.

```sh
cat <<EOF >> ~/.profile
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export GO111MODULE=on
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
EOF
source ~/.profile
go version
```

Output should be: `go version go1.19.4 linux/amd64`


#### Install Marsd from source

##### 1. Clone repository
```sh
git clone https://github.com/mars-protocol/hub
cd hub
git checkout v1.0.0-rc7
make install
```

#### 2. Init chain
```sh
marsd init <moniker> --chain-id ares-1
```

#### 3. Add/recover keys
##### To create new keypair - make sure you save the mnemonics!
```sh
marsd keys add <key-name> 
```

#### 4. Download genesis file
The genesis file is how the node will know what network to connect to.
```sh
wget -O ~/.marsd/config/genesis.json https://raw.githubusercontent.com/mars-protocol/networks/main/ares-1/genesis.json
```

#### 5. Set seeds
Seeds should be used in lieu of peers for network launch. Seeds generally are more stable, and will handle the peer exchange process for the node.
```sh
export SEEDS=TBD
sed -i.bak -e "s/^seeds *=.*/seeds = \"$SEEDS\"/" ~/.marsd/config/config.toml
```

#### 7. Start Mars
You can now launch the network!
```sh:
marsd start
```

However, running the network this way requires a shell to always be open. You can, instead, create a service file that will manage running the network for you.

```sh
sudo cat <<EOF >> /etc/systemd/system/marsd.service
[Unit]
Description=Mars Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
ExecStart=$HOME/go/bin/marsd start
Restart=on-failure
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload && systemctl enable marsd
sudo systemctl restart marsd && journalctl -o cat -fu marsd
```

####  Backup validator key

There are certain files that you need to backup to be able to restore your validator if, for some reason, it is damaged or lost in some way. Please make a secure backup of the following file located in `~/.marsd/config/`:

-   `priv_validator_key.json`

It is recommended that you encrypt the backup of these files.
