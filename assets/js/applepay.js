document.addEventListener('DOMContentLoaded', () => {
    if (window.ApplePaySession) {
    if (ApplePaySession.canMakePayments) {
        showApplePayButton();
    }
}
});

function showApplePayButton() {
    HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    const buttons = document.getElementsByClassName("apple-pay-button");
    for (let button of buttons) {
        button.className += " visible";
    }
}

/**
 * Apple Pay Logic
 * Our entry point for Apple Pay interactions.
 * Triggered when the Apple Pay button is pressed
 */
function applePayButtonClicked() {   
    var paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',

        lineItems: [
            {
                label: 'Soda',
                amount: '1.00',
			},
			            {
                label: 'Tax',
                amount: '0.99',
            }
        ],

        total: {
			label: 'TOTAL(Not charged)',
			type: 'final',
            amount: '1.99',
        },

        
	 	supportedNetworks:[ 'amex', 'discover', 'masterCard', 'visa'],
		merchantCapabilities: [ 'supports3DS'],
		merchantIdentifier: "merchant.com.venuetize.vzsample",

    };
	//alert("before");
	var session = new ApplePaySession(3, paymentRequest); 
	//alert("after "+session);
	session.begin();
	
	/**
	 * Merchant Validation
	 * We call our merchant session endpoint, passing the URL to use
	 */
	session.onvalidatemerchant = (event) => {
		const validationURL = event.validationURL; 
		//alert(validationURL);   
		getApplePaySession(validationURL).then(function(response) {
			alert(response);
			session.completeMerchantValidation(response);
		});
	};
}

/**
* Server to Server call to apple for response used to validate *merchant
*/

function getApplePaySession(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/session/create');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };      

	 xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({validationUrl: url}));
    });
}