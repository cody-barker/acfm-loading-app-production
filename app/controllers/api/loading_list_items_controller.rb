  class Api::LoadingListItemsController < ApplicationController
    before_action :set_loading_list_item, only: %i[show update destroy]

    def index
      loading_list_items = LoadingListItem.includes(:item, :loading_list, :item).all
      render json: loading_list_items
    end

    def show
      render json: @loading_list_item
    end

    def create
      loading_list_item = LoadingListItem.create!(loading_list_item_params)
      render json: loading_list_item, status: :created
    end

    def update
      @loading_list_item.update!(loading_list_item_params)
      render json: @loading_list_item, status: :ok
    end

    def destroy
      loading_list_item = LoadingListItem.find(params[:id])
      available_item = Item.find(loading_list_item.item_id)
      
      # Restore quantity in availableItems
      available_item.update(quantity: available_item.quantity + loading_list_item.quantity)

      loading_list_item.destroy
      head :no_content
    end


    private

    def set_loading_list_item
      @loading_list_item = LoadingListItem.includes(:loading_list, :item).find(params[:id])
    end

    def loading_list_item_params
      params.require(:loading_list_item).permit(:loading_list_id, :item_id, :quantity)
    end
  end
