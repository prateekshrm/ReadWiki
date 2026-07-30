import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import RemixIcon from "react-native-remix-icon";

export default function RootLayout() {
    const TAB_ICON_SIZE = 18;
    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerTransparent: true,
                header: ({ options }) => (
                    <Header
                        title={options.title ?? ""}
                        rightComponent={
                            options.headerRight?.({
                                tintColor: "#fff",
                                canGoBack: false,
                            }) ?? null
                        }
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "ReadWiki",
                    tabBarLabel: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        <RemixIcon
                            name={focused ? "home-4-fill" : "home-4-line"}
                            size={TAB_ICON_SIZE}
                            color={color as string}
                            fallback={null}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ focused, color }) => (
                        <RemixIcon
                            name={focused ? "search-2-fill" : "search-2-line"}
                            size={TAB_ICON_SIZE}
                            color={color as string}
                            fallback={null}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="flow"
                options={{
                    title: "Flow",
                }}
            />

            <Tabs.Screen
                name="saved"
                options={{
                    title: "Saved",
                    tabBarIcon: ({ focused, color }) => (
                        <RemixIcon
                            name={
                                focused
                                    ? "book-marked-fill"
                                    : "book-marked-line"
                            }
                            size={TAB_ICON_SIZE}
                            color={color as string}
                            fallback={null}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ focused, color }) => (
                        <RemixIcon
                            name={
                                focused ? "settings-3-fill" : "settings-3-line"
                            }
                            size={TAB_ICON_SIZE}
                            color={color as string}
                            fallback={null}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
