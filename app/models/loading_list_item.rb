class LoadingListItem < ApplicationRecord
  belongs_to :loading_list
  belongs_to :item

  after_save :check_loading_list_status

  private

  def check_loading_list_status
    loading_list.update_loaded_status
  end
end
