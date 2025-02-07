class Api::LoadingListsController < ApplicationController
  before_action :set_loading_list, only: [ :show, :update, :destroy ]

  def index
    loading_lists = LoadingList.includes(:user, :team, loading_list_items: :item).all
    render json: loading_lists, include: [ :team, loading_list_items: :item ]
  end

  def show
    render json: @loading_list, include: [ loading_list_items: :item ]
  end

  def create
    loading_list = LoadingList.create!(loading_list_params)
    render json: loading_list, status: :created
  end

  def update
    @loading_list.update!(loading_list_params)
    render json: @loading_list
  end

def destroy
  if @loading_list.unloaded?
    render json: { error: "Cannot delete an unloaded loading list." }, status: :forbidden
    return
  end

  @loading_list.loading_list_items.each do |loading_list_item|
    inventory_item = loading_list_item.item
    inventory_item.increment!(:quantity, loading_list_item.quantity)
  end

  @loading_list.destroy

  head :no_content
end



  private

  def set_loading_list
    @loading_list = LoadingList.includes(:user, :team, loading_list_items: :item).find(params[:id])
  end

  def loading_list_params
    params.require(:loading_list).permit(:id, :user_id, :team_id, :date, :return_date, :site_name, :notes)
  end
end
