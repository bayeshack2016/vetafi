openssl pkcs12 -export -out keystore.pkcs12 -in /etc/letsencrypt/live/vetafi.org/fullchain.pem -inkey /etc/letsencrypt/live/vetafi.org/privkey.pem

# convert PKCS#12 file into Java keystore format
keytool -importkeystore -srckeystore keystore.pkcs12 -srcstoretype PKCS12 -destkeystore keystore.jks

biscuit put --filename=secrets.yaml prod::keystore-file < keystore.jks

rm keystore.pkcs12
rm keystore.jks
