class Api::TeamsController < ApplicationController

  def index
    teams = Team.all
    render json: teams
  end 

  def show
    team = Team.find(params[:id])
    render json: team
  end 

  def create
    team = Team.new(team_params)
    if team.save
      render json: team, status: :created
    else
      render json: team.errors, status: :unprocessable_entity
    end
  end

  def update
    team = Team.find(params[:id])
    if team.update(team_params)
      render json: team
    else
      render json: team.errors, status: :unprocessable_entity
    end
  end

  private

  def team_params
    params.require(:team).permit(:name)
  end

end
