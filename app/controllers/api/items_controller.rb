class Api::ItemsController < ApplicationController
  before_action :set_item, only: %i[show update destroy]

  def index
    items = Item.all
    render json: items
  end

  def show
    render json: @item
  end

  def create
    item = Item.create!(item_params)
    render json: item, status: :created
  end

  def update
    @item.update!(item_params)
    render json: @item
  end

  def destroy
    @item.destroy
    head :no_content
  end

  private

  def set_item
    @item = Item.includes(:loading_list_items).find(params[:id])
  end


  def item_params
    params.require(:item).permit(:name, :category, :quantity, :repair_quantity)
  end
end
