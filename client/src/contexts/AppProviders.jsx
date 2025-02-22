import { UserProvider } from "./UserContext.jsx";
import { ItemsProvider } from "./ItemsContext.jsx";
import { TeamsProvider } from "./TeamsContext.jsx";
import { LoadingListsProvider } from "./LoadingListsContext.jsx";

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
