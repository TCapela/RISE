import { createNavigationContainerRef } from "@react-navigation/native";
export const navigationRef = createNavigationContainerRef();
export function navNavigate(name: string) {
  if (navigationRef.isReady()) navigationRef.navigate(name as never);
}
