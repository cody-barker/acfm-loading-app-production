class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.integer :loading_list_id
      t.string :email
      t.string :password_digest
      t.string :first_name
      t.string :last_name
      t.string :role

      t.timestamps
    end
  end
end
