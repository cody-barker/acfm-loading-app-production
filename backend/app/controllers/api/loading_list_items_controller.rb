  class Api::LoadingListItemsController < ApplicationController
    
    def index 
      loading_list_items = LoadingListItem.all
      render json: loading_list_items
    end

    def show
      loading_list_item = LoadingListItem.find(params[:id])
      render json: loading_list_item
    end

    def create
      loading_list_item = LoadingListItem.new(loading_list_item_params)
      if loading_list_item.save
        render json: loading_list_item, status: :created
      else
        render json: loading_list_item.errors, status: :unprocessable_entity
      end
    end

    def update
      loading_list_item = LoadingListItem.find(params[:id])
      if loading_list_item.update(loading_list_item_params)
        render json: loading_list_item
      else
        render json: loading_list_item.errors, status: :unprocessable_entity
      end
    end

    def destroy
      loading_list_item = LoadingListItem.find(params[:id])
      loading_list_item.destroy
      render json: {}, status: :no_content
    end

    private

    def loading_list_item_params
      params.require(:loading_list_item).permit(:loading_list_id, :item_id)
    end
  
end