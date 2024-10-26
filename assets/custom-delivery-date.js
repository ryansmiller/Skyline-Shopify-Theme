(async () => {
        const sessionKeys = {
            ip: 'ipaddress',
            country: 'country',
            region: 'region_code',
            city: 'city',
            zip: 'postal',
            deliveryDate: 'deliveryDate'
        };
    
        // Function to fetch IP data
        const API_URL = 'https://ipapi.co/json/';
        async function fetchIPData() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error('Error fetching IP address:', error);
            }
        }
    
        // Check for IP address in sessionStorage
        const ipaddress = sessionStorage.getItem(sessionKeys.ip);
        if (!ipaddress) {
            const data = await fetchIPData();
            if (data) {
                sessionStorage.setItem(sessionKeys.ip, data.ip);
                sessionStorage.setItem(sessionKeys.country, data.country);
                sessionStorage.setItem(sessionKeys.region, data.region_code);
                sessionStorage.setItem(sessionKeys.city, data.city);
                sessionStorage.setItem(sessionKeys.zip, data.postal);
                console.log(data.postal);
            }
        }
    
        // Start Luxon
        const DateTime = luxon.DateTime;
        const now = DateTime.now().setZone("America/New_York");
        const hour = now.hour;
    
        // Set date based on current hour
        let date = (hour < 14) ? now : now.plus({ days: 1 });
    
        // Ensure proper use of Luxon Business Days
        const nextBizDay = date.isBusinessDay() ? date : date.plusBusiness(1);
        const BizDay = nextBizDay.toFormat('yyyy-LL-dd');
    
        const toZip = sessionStorage.getItem(sessionKeys.zip);
        console.log(`Quoted Date: "${BizDay}"`);
    
        const token = "{{shop.metafields.custom.fedex_access_key }}"; // Ensure this is processed server-side
    
        // Function to fetch FedEx delivery date
        async function fetchFedExDeliveryDate() {
            const headerParamsEmbeddedVar = JSON.stringify({
                authorization: `Bearer ${token}`,
            });
    
            const bodyEmbeddedVar = JSON.stringify({
                accountNumber: { value: "269128925" },
                rateRequestControlParameters: { returnTransitTimes: true },
                requestedShipment: {
                    shipper: {
                        address: { postalCode: "11418", countryCode: "US" }
                    },
                    recipient: {
                        address: {
                            postalCode: toZip,
                            countryCode: "US",
                            residential: true
                        }
                    },
                    serviceType: "GROUND_HOME_DELIVERY",
                    rateRequestType: ["ACCOUNT"],
                    shipDateStamp: BizDay,
                    pickupType: "USE_SCHEDULED_PICKUP",
                    requestedPackageLineItems: [{ weight: { units: "LB", value: 10 } }]
                }
            });
    
            const queryParams = new URLSearchParams({
                requestId: "a23313e0-8812-11ef-8ac8-7d9bb588dd65",
                headersEmbedded: headerParamsEmbeddedVar,
                bodyEmbedded: bodyEmbeddedVar,
            });
    
            try {
                const response = await fetch(`/apps/apiease/integration/caller/call?${queryParams}`);
                const jsonResponse = await response.json();
                console.log(jsonResponse);
                return jsonResponse.data.output.rateReplyDetails[0].commit.dateDetail.dayFormat;
            } catch (error) {
                console.error('Error fetching FedEx delivery date:', error);
            }
        }
    
        const FedExDeliveryDate = sessionStorage.getItem(sessionKeys.deliveryDate);
        if (!FedExDeliveryDate) {
            const deliveryDate = await fetchFedExDeliveryDate();
            if (deliveryDate) {
                sessionStorage.setItem(sessionKeys.deliveryDate, deliveryDate);
            }
        }
    
        const dd = DateTime.fromISO(sessionStorage.getItem(sessionKeys.deliveryDate));
        if (dd.isValid) {
            document.getElementById("dateInStock").innerHTML = dd.toFormat('cccc, LLLL d');
            document.getElementById("shipLocation").innerHTML = `going to ${sessionStorage.getItem(sessionKeys.city)}, ${sessionStorage.getItem(sessionKeys.region)}`;
        }
    })();