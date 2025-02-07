class AddUnloadedToLoadingLists < ActiveRecord::Migration[8.0]
  def change
    add_column :loading_lists, :unloaded, :boolean, default: false, null: false
  end
end
