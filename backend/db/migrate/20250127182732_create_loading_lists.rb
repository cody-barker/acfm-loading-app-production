class CreateLoadingLists < ActiveRecord::Migration[7.2]
  def change
    create_table :loading_lists do |t|
      t.integer :user_id
      t.integer :team_id
      t.date :date
      t.date :return_date
      t.string :site_name
      t.string :notes

      t.timestamps
    end
  end
end
