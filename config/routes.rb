Rails.application.routes.draw do
get "*path", to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html? }

namespace :api do
    resources :loading_list_items
    resources :items
    resources :loading_lists
    resources :teams
    resources :users
end

get "/me", to: "sessions#show"
post "/login", to: "sessions#create"
delete "/logout", to: "sessions#destroy"

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

# Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
# Can be used by load balancers and uptime monitors to verify that the app is live.
get "up" => "rails/health#show", as: :rails_health_check
end
