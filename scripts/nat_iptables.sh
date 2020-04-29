#sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
#sudo iptables -I INPUT 1 -p tcp --dport 8080 -j ACCEPT
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
# sudo iptables -t nat -A PREROUTING -d 8.8.8.8/32 -j ACCEPT
# sudo iptables -t nat -A PREROUTING -p tcp --dport 433 -j REDIRECT --to-port 8080
# sudo iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

