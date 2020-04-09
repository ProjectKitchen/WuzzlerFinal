sudo cp orig_etc_dhcpcd.conf /etc/dhcpcd.conf
sudo cp orig_etc_dnsmasq.conf /etc/dnsmasq.conf
sudo systemctl restart dhcpcd
sudo systemctl stop hostapd
sudo systemctl disable hostapd
sudo service dnsmasq stop


