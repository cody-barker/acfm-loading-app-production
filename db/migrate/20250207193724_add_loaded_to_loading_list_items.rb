class AddLoadedToLoadingListItems < ActiveRecord::Migration[8.0]
  def change
    add_column :loading_list_items, :loaded, :boolean, default: false, null: false
  end
end
