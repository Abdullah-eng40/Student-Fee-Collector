import { ThemedView } from "@/components/themed-view";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    sessionToken?: string;
    user?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for sessionToken in params first (web OAuth callback from server redirect)
        if (params.sessionToken) {
          await Auth.setSessionToken(params.sessionToken);

          // Decode and store user info if available
          if (params.user) {
            try {
              // Use atob for base64 decoding (works in both web and React Native)
              const userJson =
                typeof atob !== "undefined"
                  ? atob(params.user)
                  : Buffer.from(params.user, "base64").toString("utf-8");
              const userData = JSON.parse(userJson);
              if (userData.id && userData.email) {
                const userInfo: Parameters<typeof Auth.setUserInfo>[0] = {
                  id: userData.id,
                  email: userData.email,
                  name: userData.name || "User",
                  avatar: userData.avatar || null,
                  lastSignedIn: new Date(userData.lastSignedIn || Date.now()),
                };
                await Auth.setUserInfo(userInfo);
              }
            } catch (err) {
            }
          }

          setStatus("success");
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1000);
          return;
        }

        // Native app OAuth flow (using Authorization Code Flow)
        // The server will handle the token exchange and return a sessionToken

        // Try to get from local search params first (works with expo-router)
        if (params.code || params.state || params.error) {
          // Extract from params
          const urlParams = new URLSearchParams();
          if (params.code) urlParams.set("code", params.code);
          if (params.state) urlParams.set("state", params.state);
          if (params.error) urlParams.set("error", params.error);
          var url: string = `?${urlParams.toString()}`;
        } else {
          // Try to get from initial URL
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl == null) {
            setErrorMessage("No OAuth response received");
            setStatus("error");
            return;
          }
          url = new URL(initialUrl).search;
        }

        // Handle error response
        if (params.error) {
          setErrorMessage(params.error);
          setStatus("error");
          return;
        }

        // Handle authorization code
        if (params.code) {
          // Exchange code for session token
          const response = await Api.post("/auth/oauth/callback", {
            code: params.code,
            state: params.state,
          });

          if (response.sessionToken) {
            await Auth.setSessionToken(response.sessionToken);

            // Store user info if available
            if (response.user) {
              const userInfo: Parameters<typeof Auth.setUserInfo>[0] = {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name || "User",
                avatar: response.user.avatar || null,
                lastSignedIn: new Date(),
              };
              await Auth.setUserInfo(userInfo);
            }

            setStatus("success");
            setTimeout(() => {
              router.replace("/(tabs)");
            }, 1000);
          } else {
            setErrorMessage("Failed to obtain session token");
            setStatus("error");
          }
        } else {
          setErrorMessage("No authorization code received");
          setStatus("error");
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to complete authentication",
        );
        setStatus("error");
      }
    };

    handleCallback();
  }, [params.code, params.state, params.error, params.sessionToken, params.user, router]);

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <ThemedView className="flex-1 items-center justify-center gap-4 p-5">
        {status === "processing" && (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-base text-foreground">Completing sign in...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text className="text-2xl font-bold text-foreground">Success!</Text>
            <Text className="text-base text-muted text-center">
              You have been signed in successfully. Redirecting...
            </Text>
          </>
        )}

        {status === "error" && (
          <>
            <Text className="text-2xl font-bold text-error">Error</Text>
            <Text className="text-base text-muted text-center">{errorMessage}</Text>
            <Text
              className="text-base text-primary mt-4 underline"
              onPress={() => router.replace("/")}
            >
              Go back to home
            </Text>
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
