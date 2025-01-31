class LoadingListItem < ApplicationRecord
  belongs_to :loading_list
  belongs_to :item
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
end
