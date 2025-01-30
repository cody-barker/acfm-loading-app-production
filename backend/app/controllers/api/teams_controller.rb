class Api::TeamsController < ApplicationController
  before_action :set_team, only: %i[show update destroy]

  def index
    teams = Team.includes(:loading_lists).all
    render json: teams
  end 

  def show
    render json: @team
  end 

  def create
    team = Team.create!(team_params)
    render json: team, status: :created
  end

  def update
    @team.update!(team_params)
    render json: @team
  end

  def destroy
    @team.destroy
    head :no_content
  end

  private

  def set_team
    @team = Team.includes(:loading_lists).find(params[:id])
  end

  def team_params
    params.require(:team).permit(:name)
  end

end
