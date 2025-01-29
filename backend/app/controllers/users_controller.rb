class UsersController < ApplicationController
  def index
    users = User.all
    render json: users
  end

  private 

  def user_params
    params.require(:user).permit(:email, :password_digest, :first_name, :last_name, :role)
  end 
end
