import { UserProvider } from "./UserContext.js";
import { ItemsProvider } from "./ItemsContext.js";
import { TeamsProvider } from "./TeamsContext.js";
import { LoadingListsProvider } from "./LoadingListsContext.js";

const AppProviders = ({ children }) => {
  return (
    <UserProvider>
      <ItemsProvider>
        <TeamsProvider>
          <LoadingListsProvider>{children}</LoadingListsProvider>
        </TeamsProvider>
      </ItemsProvider>
    </UserProvider>
  );
};

export default AppProviders;
