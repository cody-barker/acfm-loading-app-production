class ApplicationController < ActionController::API
  include ActionController::Cookies
  rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found_resp
  rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity_resp
  before_action :authorize

  def authorize
    render json: {error: "Not authorized."}, status: :unauthorized unless session[:user_id]
  end

  def render_unprocessable_entity_resp(e)
    render json: {errors: e.record.errors.full_messages}, status: :unprocessable_entity
  end

  def render_record_not_found_resp
    render json: {error: "Record not found."}, status: :not_found
  end
end
