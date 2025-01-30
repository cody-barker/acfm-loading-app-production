  class Api::LoadingListsController < ApplicationController
    
    def index 
      loading_lists = LoadingList.all
      render json: loading_lists
    end

    def show
      loading_list = LoadingList.find(params[:id])
      render json: loading_list
    end

    def create
      loading_list = LoadingList.new(loading_list_params)
      if loading_list.save
        render json: loading_list, status: :created
      else
        render json: loading_list.errors, status: :unprocessable_entity
      end
    end

    def update
      loading_list = LoadingList.find(params[:id])
      if loading_list.update(loading_list_params)
        render json: loading_list
      else
        render json: loading_list.errors, status: :unprocessable_entity
      end
    end

    def destroy
      loading_list = LoadingList.find(params[:id])
      loading_list.destroy
      render json: {}, status: :no_content
    end

    private

    def loading_list_params
      params.require(:loading_list).permit(:name, :description)
    end

end

