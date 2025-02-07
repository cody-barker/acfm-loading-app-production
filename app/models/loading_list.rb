class LoadingList < ApplicationRecord
  belongs_to :user
  belongs_to :team
  has_many :loading_list_items
  has_many :items, through: :loading_list_items
  validates :date, :return_date, :site_name, presence: true
  validates :site_name, length: { minimum: 3, maximum: 50 }

  def update_loaded_status
    self.update(loaded: loading_list_items.all?(&:loaded))
  end
end
