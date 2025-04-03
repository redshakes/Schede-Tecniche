import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductList from "@/pages/product-list";
import ProductForm from "@/pages/product-form";
import AdminUsersPage from "@/pages/admin-users";
import AdminGroupsPage from "@/pages/admin-groups";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <ProtectedRoute path="/" component={HomePage} />}
      </Route>
      <Route path="/products">
        {() => <ProtectedRoute path="/products" component={ProductList} />}
      </Route>
      <Route path="/products/new">
        {() => <ProtectedRoute path="/products/new" component={ProductForm} />}
      </Route>
      <Route path="/products/:id">
        {() => <ProtectedRoute path="/products/:id" component={ProductForm} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute path="/admin/users" component={AdminUsersPage} />}
      </Route>
      <Route path="/admin/groups">
        {() => <ProtectedRoute path="/admin/groups" component={AdminGroupsPage} />}
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="schede-tecniche-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
