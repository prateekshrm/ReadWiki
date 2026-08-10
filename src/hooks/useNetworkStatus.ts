import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean>(true);

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state) => {
            setIsConnected(Boolean(state.isConnected));
        });

        // Subscribe to network changes
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(Boolean(state.isConnected));
        });

        return unsubscribe;
    }, []);

    return isConnected;
}

export default useNetworkStatus;
