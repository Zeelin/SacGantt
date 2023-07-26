(function () {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
        <style>
            .api-calls {
                display: flex;
                flex-direction: column;
                width: 200px;
                background-color: #f0f0f0;
                border-radius: 4px;
                padding: 10px;
            }

            .buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-gap: 5px;
            }

            .buttons > button {
                height: 30px;
                border: none;
                color: #fff;
                border-radius: 4px;
            }

            .buttons > button:active {
                transform: scale(0.95);
            }

            .buttons > button {
                background-color: #5F6A9D;
            }
        </style>
        <div class="api-calls">
            <div class="buttons">
                <button id="getAccessToken">Get Access Token</button>
                <button id="getCsrfToken">Get CSRF Token</button>
                <button id="createJob">Create Job</button>
                <button id="uploadData">Upload Data</button>
                <button id="validateJob">Validate Job</button>
                <button id="runJob">Run Job</button>
            </div>
        </div>
    `;

    let accessToken, csrfToken, jobUrl, validateJobURL, runJobURL;

    const csrfTokenUrl = 'https://sac-d-bit.eu10.hcs.cloud.sap/api/v1/csrf';
    const clientId = 'sb-d36bd0cc-eaaf-4fa8-8897-5b069998a8d9!b134293|client!b3650';
    const clientSecret = '7f7889df-1504-49f2-9e38-e2de480d85a2$NDPTA7KjiS3YdGl0wDjwukEKlYmwknVyVQyauFxanAE=';
    const tokenUrl = 'https://sac-d-bit.authentication.eu10.hana.ondemand.com/oauth/token';
    const apiEndpoint = 'https://sac-d-bit.eu10.hcs.cloud.sap/api/v1/dataimport/models/Cdlg2a1kkbj139ea3kjvk86s05k';
    const jobSettings = {
        "importType": "factData",
        "Mapping": {  
            "Version": "Version", 
            "Date": "Date",
            "id": "id",
            "progress": "progress"
        },
        "JobSettings": {
            "importMethod": "Append"
        }
    };
    const csvData = `Version,Date,id,progress
public.Actual,202401,1,1000`;

    function getAccessToken() {
        return fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`
        })
        .then(response => response.json())
        .then(data => {
            accessToken = data.access_token;
            console.log('Access token:', accessToken);
        })
        .catch(error => console.error('Error:', error));
    }

    function getCsrfToken() {
        if (!accessToken) {
            console.log('Access token is not set');
            return;
        }

        return fetch(csrfTokenUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': 'fetch',
                'x-sap-sac-custom-auth' :  'true'
            }
        })
        .then(response => {
            csrfToken = response.headers.get('x-csrf-token');
            console.log('CSRF token:', csrfToken);
        })
        .catch(error => console.error('Error:', error));
    }

    function createJob() {
        if (!accessToken || !csrfToken) {
            console.log('Access token or CSRF token is not set');
            return;
        }

        return fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': csrfToken,
                'x-sap-sac-custom-auth' :  'true'
            },
            body: JSON.stringify(jobSettings)
        })
        .then(response =>  { 
            console.log(response);  // Log the raw response object.
        return response.json(); }  )
        .then(data => {
            jobUrl = data.jobURL;
            console.log('Job URL:', jobUrl);
        })
        .catch(error => console.error('Error:', error));
    }

    function uploadData() {
      console.log('uploadData is triggered');
        if (!accessToken || !csrfToken || !jobUrl) {
            console.log('Access token, CSRF token, or job URL is not set');
            return;
        }
   // Log the values of accessToken, csrfToken, and jobUrl
    console.log('accessToken:', accessToken);
    console.log('csrfToken:', csrfToken);
    console.log('jobUrl:', jobUrl);
    console.log('csvData:', csvData);
        return fetch(jobUrl, {                   
            method: 'POST',
            headers: {
                'Content-Type': 'text/csv',
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': csrfToken,
                'x-sap-sac-custom-auth' :  'true'
            },
            body: csvData
        }) 
         .then(response =>  { 
            console.log(response);  // Log the raw response object.
        return response.json(); }  )
        .then(data => {
             console.log(data); 
            validateJobURL = data.validateJobURL;
            runJobURL = data.runJobURL;
            console.log('Validate job URL:', validateJobURL);
            console.log('Run job URL:', runJobURL);
        })
        .catch(error => console.error('Error:', error));
    }

    function validateJob() {
        if (!accessToken || !csrfToken || !validateJobURL) {
            console.log('Access token, CSRF token, or validate job URL is not set');
            return;
        }

        return fetch(validateJobURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': csrfToken,
                'x-sap-sac-custom-auth' :  'true'
            }
        })
        .then(response => response.json())
.then(data => {
        console.log('Job validation response:', data);
        if (data.failedNumberRows > 0) {
            invalidRowsURL = data.invalidRowsURL;
            console.log('Invalid rows URL:', invalidRowsURL);
            // Fetch the invalid rows
            return fetch(invalidRowsURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-csrf-token': csrfToken,
                    'x-sap-sac-custom-auth' :  'true'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Invalid rows:', data);
            })
            .catch(error => console.error('Error:', error));
        }
    })
    .catch(error => console.error('Error:', error));
    }

    function runJob() {
        if (!accessToken || !csrfToken || !runJobURL) {
            console.log('Access token, CSRF token, or run job URL is not set');
            return;
        }

        return fetch(runJobURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/csv',
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': csrfToken,
                'x-sap-sac-custom-auth' :  'true'
            }
        })
        .then(response => response.json())
    .then(data => {
        console.log('Job run response:', data);
        jobStatusURL = data.jobStatusURL;
        console.log('Job status URL:', jobStatusURL);
        // Fetch the job status
        return fetch(jobStatusURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-csrf-token': csrfToken,
                'x-sap-sac-custom-auth' :  'true'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Job status:', data);
        })
        .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
    }

    class SACAPICalls extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({mode: 'open'});
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            this._shadowRoot.getElementById('getAccessToken').addEventListener('click', getAccessToken);
            this._shadowRoot.getElementById('getCsrfToken').addEventListener('click', getCsrfToken);
            this._shadowRoot.getElementById('createJob').addEventListener('click', createJob);
            this._shadowRoot.getElementById('uploadData').addEventListener('click', uploadData);
            this._shadowRoot.getElementById('validateJob').addEventListener('click', validateJob);
            this._shadowRoot.getElementById('runJob').addEventListener('click', runJob);
        }
    }

    customElements.define('sac-api-calls', SACAPICalls);
})();
