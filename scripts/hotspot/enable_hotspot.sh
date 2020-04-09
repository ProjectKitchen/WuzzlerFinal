sudo cp etc_dhcpcd.conf /etc/dhcpcd.conf
sudo cp etc_hostapd_hostapd.conf /etc/hostapd/hostapd.conf
sudo cp etc_default_hostapd /etc/default/hostapd
sudo cp etc_dnsmasq.conf /etc/dnsmasq.conf
sudo systemctl restart dhcpcd

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd
sudo service dnsmasq start
