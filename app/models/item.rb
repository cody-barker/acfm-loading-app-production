class Item < ApplicationRecord
  has_many :loading_list_items
  validates :name, :category, presence: true, length: { minimum: 2, maximum: 50 }
  # validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
end
