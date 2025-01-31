class CreateLoadingListItems < ActiveRecord::Migration[7.2]
  def change
    create_table :loading_list_items do |t|
      t.integer :loading_list_id
      t.integer :item_id
      t.integer :quantity

      t.timestamps
    end
  end
end
