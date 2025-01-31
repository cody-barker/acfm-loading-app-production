class Team < ApplicationRecord
  has_many :loading_lists
  validates :name, presence: true, length: { minimum: 1, maximum: 50 }
end
