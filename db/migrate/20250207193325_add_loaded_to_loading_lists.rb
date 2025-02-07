class AddLoadedToLoadingLists < ActiveRecord::Migration[8.0]
  def change
    add_column :loading_lists, :loaded, :boolean, default: false, null: false
  end
end
