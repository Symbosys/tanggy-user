import { useEffect, useState } from "react";
import { Button, Platform, Text, TouchableOpacity, View } from "react-native";
import PhonePePaymentSDK from 'react-native-phonepe-pg';

const TestOrder = () => {
    const [requestBody, setRequestBody] = useState<string>('here is your order');
    const [merchantId, setMerchantId] = useState<string>('M23WDWBKJVZNR');
    const [flowId, setFlowId] = useState<string>('user-test-' + Math.floor(Math.random() * 1000));

    const [openEnvironment, setOpenEnvironment] = useState(false);
    const [environment, setEnvironmentValue] = useState('SANDBOX');
    const [callbackURL, setCallbackURL] = useState<string>('mintafresh');

    const [message, setMessage] = useState<string>('Message: ');


    const handleStartTransaction = () => {
        PhonePePaymentSDK.startTransaction(
            requestBody,
            callbackURL
        ).then(a => {
            console.log({ a })
            setMessage(JSON.stringify(a));
        }).catch(error => {
            console.log({ error })
            setMessage("error:" + error.message);
        })
    };

    const initPhonePeSDK = () => {
        PhonePePaymentSDK.init(
            environment,
            merchantId,
            flowId,
            true
        ).then(result => {
            console.log({ result })
            setMessage("Message: SDK Initialisation ->" + JSON.stringify(result));
        }).catch(error => {
            console.log({ error })
            setMessage("error:" + error.message);
        })
    };

    useEffect(() => {
        initPhonePeSDK();
    }, []);

    const getUPIAppsInstalledForiOS = () => {
        PhonePePaymentSDK.getUPIAppsInstalledforIos().then(a => {
            console.log({ a })
            setMessage(JSON.stringify(a));
        }).catch(error => {
            setMessage("error:" + error.message);
        })
    };

    const getUPIAppsInstalled = () => {
        if (Platform.OS == "ios") {
            getUPIAppsInstalledForiOS();
        } else {
            PhonePePaymentSDK.getUpiAppsForAndroid().then(a => {
                console.log({ a })
                setMessage(JSON.stringify(a));
            }).catch(error => {
                console.log({ error })
                setMessage("error:" + error.message);
            })
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
                style={{
                    backgroundColor: "#0071bc",
                    padding: 10,
                    borderRadius: 5,
                    margin: 10
                }}
                onPress={handleStartTransaction}
            >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                    Place Order
                </Text>
            </TouchableOpacity>



            <TouchableOpacity
                style={{
                    backgroundColor: "#0071bc",
                    padding: 10,
                    borderRadius: 5,
                    margin: 10
                }}
                onPress={getUPIAppsInstalled}
            >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                    Get Installed Apps
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TestOrder;