import WalletSecurityNav from './WalletSecurity/router';
import WalletHomeNav from './WalletHome/router';
import accountSettingsNav from './AccountSettings/router';
import ContactsNav from './Contacts/index';
import GuardianNav from './Guardian/index';
import UserReferral from './UserReferral/index';
import { ComposePage } from './ComposeMe';

const stackNav = [
  ...WalletSecurityNav,
  ...WalletHomeNav,
  ...accountSettingsNav,
  ...ContactsNav,
  ...GuardianNav,
  { name: 'UserReferral', component: UserReferral },
  { name: 'ComposeMe', component: ComposePage },
] as const;

export default stackNav;
