class Item < ApplicationRecord
  has_many :loading_list_items
  validates :name, :category, presence: true, length: { minimum: 2, maximum: 50 }
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :repair_quantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
end
