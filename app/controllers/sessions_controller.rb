class SessionsController < ApplicationController
skip_before_action :authorize, only: [ :create, :signup ]

    def create
        user = User.includes(:loading_lists).find_by(email: params[:email])
        if user&.authenticate(params[:password])
            session[:user_id] = user.id
            render json: user, status: :created
        else
            render json: { errors: [ "Incorrect username or password" ] }, status: :unauthorized
        end
    end

    def show
        user = User.find_by(id: session[:user_id])
        if user
            render json: user, status: :ok
        else
            render json: { error: "User not found" }, status: :not_found
        end
    end

    def signup
        role = determine_role(params[:token])
        return if performed? # Exit if determine_role already rendered a response

        user = User.new(
            email: params[:email],
            password: params[:password],
            password_confirmation: params[:password_confirmation],
            first_name: params[:first_name],
            last_name: params[:last_name],
            role: role
        )

        if user.save
            session[:user_id] = user.id
            render json: user, status: :created
        else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def destroy
        session.delete(:user_id)
        head :no_content
    end

    private

    def determine_role(token)
        case token&.downcase
        when "pm2023"
            "pm"
        when "loader2023"
            "loader"
        else
            render json: { errors: ["Invalid employee token"] }, status: :unprocessable_entity
            nil
        end
    end
end
