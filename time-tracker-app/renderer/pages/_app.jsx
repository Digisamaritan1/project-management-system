import '../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../store/store';
import { useEffect } from 'react';
import { clearProjects } from '../store/projectSlice';
import Layout from '../components/Layout/Layout';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Clear projects when app starts to ensure no persistence
    store.dispatch(clearProjects());
  }, []);

  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}

export default MyApp;