class Api::ItemsController < ApplicationController
  before_action :set_item, only: %i[show update destroy]

  def index
    items = Item.includes(:loading_list_items).all
    render json: items
  end

  def show
    render json: @item
  end

  def create
    item = Item.new(item_params)
    if item.save
      render json: item, status: :created
    else
      render json: item.errors, status: :unprocessable_entity
    end
  end

  def update
    if @item.update(item_params)
      render json: @item
    else
      render json: @item.errors, status: :unprocessable_entity
    end
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
    params.require(:item).permit(:name, :category, :quantity)
  end
end
