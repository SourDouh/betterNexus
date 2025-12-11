// Fetch and display tutorial links from tutorialLinks.txt (new format)
    async function getDirectory(dirname) {
        let response = await fetch(dirname);
        let str = await response.text();
        let el = document.createElement('html');
        el.innerHTML = str;

        // this parse will work for http-server and may have to be modified for other
        // servers. Inspect the returned string to determine the proper parsing method
        let list = el.getElementsByTagName("table")[0].getElementsByTagName("a");
        let arr = [];
        for (i = 0; i < list.length; i++) {
            arr[i] = list[i].innerHTML;
            arr[i] = (dirname) + arr[i];
        }
        arr.shift(); // get rid of first result which is the "../" directory reference
        // Filter out .DS_Store and other unwanted files
        arr = arr.filter(file => !file.includes('.DS_Store'));
        console.log(arr); // this is your list of files (or directories ending in "/")
        return (arr);
    }
    async function loadLinks(filelist) {
        // filelist is expected to be an array of file URLs
        const filesData = [];
        for (const file of filelist) {
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error('Failed to load ' + file);
                const text = await response.text();

                // Extract title (line starting with #)
                const titleMatch = text.match(/^#(.+)$/m);
                const title = titleMatch ? titleMatch[1].trim() : (file.split('/').pop() || file);

                // Extract link entries (non-comment, non-title lines)
                const linkRegex = /^(?!\/\/)(?!#)(\S+)\s+(.+)$/gm;
                const links = [];
                let match;
                while ((match = linkRegex.exec(text)) !== null) {
                    links.push({ link: match[1], name: match[2].trim() });
                }

                filesData.push({ file, title, links });
            } catch (e) {
                console.log('Error fetching file:', file, e);
            }
        }

        // Once all files are processed, populate the sidebar
        if (filesData.length) {
            populateSidebar(filesData);
        }

        return filesData;
    }

    // Resolve the directory promise and pass the resolved array to loadLinks
    (async () => {
        const files = await getDirectory('static/');
        await loadLinks(files);
    })();

    function populateSidebar(filesData){
        const ul = document.querySelector('.side-panel ul');
        if (!ul) return;
        
        // Don't clear the entire ul; instead find or preserve the Home button
        // Remove only the dynamic file tabs (not the Home button)
        const dynamicTabs = ul.querySelectorAll('li:not(:first-child)');
        dynamicTabs.forEach(tab => tab.remove());

        filesData.forEach((fdata, idx) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'unactive';
            btn.textContent = fdata.title;
            btn.addEventListener('click', () => {
                // mark active
                document.querySelectorAll('.side-panel button').forEach(el => {
                    el.classList.remove('active');
                    el.classList.add('unactive');
                });
                btn.classList.remove('unactive');
                btn.classList.add('active');
                populateLinks(fdata.title, fdata.links);
            });
            li.appendChild(btn);
            ul.appendChild(li);

            // Don't auto-activate file tabs; Home tab will be active by default
            // (it's activated separately in home.html)
        });
    }

    function populateLinks(title, links){
        const linksContainer = document.getElementById('links-container');
        if (!linksContainer) return;
        linksContainer.innerHTML = '';

        const h = document.createElement('h2');
        h.textContent = title || 'Links';
        linksContainer.appendChild(h);

        if (!links || links.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No links available.';
            linksContainer.appendChild(p);
            return;
        }

        const ulEl = document.createElement('ul');
        links.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = /:\/\//.test(item.link) ? item.link : `https://${item.link}`;
            a.textContent = item.name || item.link;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            ulEl.appendChild(li);
        });
        linksContainer.appendChild(ulEl);
    }
