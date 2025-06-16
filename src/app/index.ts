import { withProviders } from './providers';
import { AppRouter } from './router';

export const App = withProviders(AppRouter);