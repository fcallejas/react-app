import AppMenu from "../components/AppMenu";

export default function Dashboard() {
  const user = JSON.parse(localStorage.user).id; // debe tener user.id
  const lang = localStorage.getItem('lang') || 'es';
  console.log('user',user);
  console.log('lang',lang);

  return <AppMenu userId={user} lang={lang} />;
}
