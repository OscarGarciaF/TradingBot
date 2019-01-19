#! /bin/bash
echo start startup script
sudo -u garcia_oscar1729 bash -c 'cd ~/; cd TradingBot; forever start index.js '
EOF