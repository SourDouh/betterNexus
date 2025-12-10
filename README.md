# Welcome to BetterNexus™, the Nexus but better.

Better Nexus allows you to take all the useful links not just in the nexus but everywhere else - tutorial signups, important documents, or any other link, and organize it in an easy to use way.

Instructions on how to use it are located within the "Home" page of BetterNexus™.

### Installation Guide:
Open terminal and type
```
git clone https://github.com/SourDouh/betterNexus/
sudo mv betterNexus /Library/WebServer/Documents
sudo apachectl start
```

Then, open the link http://localhost/betterNexus/home.html
It's that that simple!


### Other info
There are two tests available in the **testsForDevelopers** folder. The first test will execute the javascript and ensure that the actual output matches the expected output. You can run it with this command:
```
node testJs.js [fileToTest] [ExpectedOutput]
```

The second test is a spider that will crawl through every link and make sure they are working, and it returns what it finds and any links not returning status code 200 (ok).
WARNING: The spider struggles on long URLs, such as the one in the evals document. If a url is too long it will not check it properly, and instead return that it was too long.
The spider can be run with this command:
```
zsh spider.zsh
```
