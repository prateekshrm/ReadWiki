import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean>(true);

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state) => {
            const connected =
                state.isConnected !== false && state.isInternetReachable !== false;
            setIsConnected(connected);
        });

        // Subscribe to network changes
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected =
                state.isConnected !== false && state.isInternetReachable !== false;
            setIsConnected(connected);
        });

        return unsubscribe;
    }, []);

    return isConnected;
}

export default useNetworkStatus;
